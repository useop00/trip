let map, marker, infowindow, service;
let selectedPlaces = []; // 선택된 장소 배열
let markers = []; // 지도에 표시된 마커 배열

async function init() {
    await customElements.whenDefined('gmp-map');

    map = document.querySelector('gmp-map');
    marker = document.querySelector('gmp-advanced-marker');
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map.innerMap);

    map.innerMap.setOptions({
        mapTypeControl: false
    });

    const placePicker = document.querySelector('gmpx-place-picker');
    placePicker.addEventListener('gmpx-placechange', () => {
        const place = placePicker.value;

        if (!place.location) {
            window.alert("No details available for input: '" + place.name + "'");
            infowindow.close();
            marker.position = null;
            return;
        }

        if (place.viewport) {
            map.innerMap.fitBounds(place.viewport);
        } else {
            map.center = place.location;
            map.zoom = 17;
        }

        marker.position = place.location;
        infowindow.setContent(`
            <strong>${place.displayName}</strong><br>
            <span>${place.formattedAddress}</span><br>
            <button onclick="addPlace('${place.displayName}', ${place.location.lat()}, ${place.location.lng()})">+</button>
        `);
        infowindow.open(map.innerMap, marker);

        searchNearbyPlaces(place.location, 'tourist_attraction');
    });

    loadPlans(); // 페이지 로드 시 계획 목록 불러오기
}

// 계획 저장 함수 추가
function savePlan() {
    const title = prompt("계획의 제목을 입력하세요");
    if (!title) {
        alert("제목을 입력해야 합니다.");
        return;
    }

    // PlaceDto 형태에 맞게 데이터 변환
    const places = selectedPlaces.map((place, index) => ({
        placeName: place.placeName,
        sequence: index + 1
    }));

    const planData = {
        title: title,
        places: places
    };

    fetch('/plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요하다면 헤더에 추가
        },
        credentials: 'include',
        body: JSON.stringify(planData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => { throw new Error(text) });
            }
        })
        .then(data => {
            alert("계획이 저장되었습니다.");
            console.log('저장된 계획:', data);
            resetSelectedPlaces(); // 선택한 장소 초기화
            loadPlans(); // 저장 후 계획 목록 갱신
        })
        .catch(error => {
            console.error('Error:', error);
            alert("계획 저장 중 오류가 발생했습니다: " + error.message);
        });
}

// 계획 목록 불러오기 함수 추가
function loadPlans() {
    fetch('/plans', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요하다면 헤더에 추가
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('사용자의 계획들:', data);
            displayPlans(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 계획 목록 표시 함수 추가
function displayPlans(plans) {
    const plansList = document.getElementById('plans-list');
    plansList.innerHTML = ''; // 기존 목록 초기화

    plans.forEach(plan => {
        const li = document.createElement('li');
        li.classList.add('plan-item');
        li.innerHTML = `
            <strong>${plan.title}</strong>
            <button onclick="viewPlan(${plan.id})">보기</button>
        `;
        plansList.appendChild(li);
    });
}

// 특정 계획 상세 조회 함수 추가
function viewPlan(planId) {
    fetch(`/plans/${planId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요하다면 헤더에 추가
        }
    })
        .then(response => response.json())
        .then(plan => {
            console.log('선택한 계획:', plan);
            // 선택한 계획의 장소들로 지도와 목록 업데이트
            selectedPlaces = plan.places.map(place => ({
                placeName: place.placeName,
                lat: place.lat, // 서버에서 lat, lng 정보를 함께 제공해야 합니다.
                lng: place.lng
            }));
            updateSelectedPlaces();
            updateMarkers();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function addPlace(name, lat, lng) {
    if (!selectedPlaces.some(p => p.placeName === name)) {
        selectedPlaces.push({ placeName: name, lat, lng });
        updateSelectedPlaces();
        updateMarkers();
    }
}

function searchNearbyPlaces(location, placeType, food = '') {
    const request = {
        location: location,
        radius: '3000',
        type: [placeType],
        keyword: food, // 음식 종류 추가
        language: 'ko' // 한국어로 설정
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));

            const list = document.getElementById('places-list');
            list.innerHTML = ''; // 이전 결과 지우기

            results.forEach((result, index) => {
                const li = document.createElement('li');
                let placeImage = '';

                if (result.photos && result.photos.length > 0) {
                    placeImage = `<img src="${result.photos[0].getUrl({maxWidth: 150, maxHeight: 150})}" alt="${result.name}">`;
                }

                li.innerHTML = `
                    ${placeImage}
                    <div class="place-details">
                        <strong>${result.name}</strong>
                        <span class="rating">리뷰 수: ${result.user_ratings_total || 0}</span>
                    </div>
                    <button class="add-btn" data-place-name="${result.name}" data-lat="${result.geometry.location.lat()}" data-lng="${result.geometry.location.lng()}">+</button>
                `;

                li.addEventListener('click', () => {
                    marker.position = result.geometry.location;
                    infowindow.setContent(`
                        <strong>${result.name}</strong><br>
                        <span>${result.vicinity}</span><br>
                        <button onclick="addPlace('${result.name}', ${result.geometry.location.lat()}, ${result.geometry.location.lng()})">+</button>
                    `);
                    infowindow.open(map.innerMap, marker);
                });
                list.appendChild(li);
            });

            // "+" 버튼 클릭 이벤트
            document.querySelectorAll('.add-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const placeName = this.getAttribute('data-place-name');
                    const lat = parseFloat(this.getAttribute('data-lat'));
                    const lng = parseFloat(this.getAttribute('data-lng'));

                    if (!selectedPlaces.some(p => p.placeName === placeName)) {
                        selectedPlaces.push({ placeName, lat, lng });
                        updateSelectedPlaces();
                        updateMarkers();
                    }
                });
            });
        }
    });
}

function updateSelectedPlaces() {
    const selectedPlacesPanel = document.getElementById('selected-places');
    selectedPlacesPanel.innerHTML = ''; // 기존 패널 내용 초기화

    selectedPlaces.forEach((place, index) => {
        const div = document.createElement('div');
        div.classList.add('selected-place');
        div.setAttribute('data-index', index);
        div.setAttribute('draggable', true); // 드래그 가능하도록 설정

        div.innerHTML = `
            <span>${index + 1}. ${place.placeName}</span>
            <button class="remove-btn" data-index="${index}">X</button>
        `;

        selectedPlacesPanel.appendChild(div);

        // 드래그 이벤트 처리
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        div.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedIndex = e.dataTransfer.getData('text/plain');
            const targetIndex = e.target.closest('.selected-place').getAttribute('data-index');

            // 순서 변경
            const draggedPlace = selectedPlaces.splice(draggedIndex, 1)[0];
            selectedPlaces.splice(targetIndex, 0, draggedPlace);

            updateSelectedPlaces(); // 순서가 변경된 리스트 재생성
            updateMarkers(); // 마커 순서도 재생성
        });
    });

    // "X" 버튼 클릭 시 삭제 이벤트
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function () {
            const index = parseInt(this.getAttribute('data-index'));
            selectedPlaces.splice(index, 1); // 선택한 장소 배열에서 삭제
            updateSelectedPlaces(); // 패널 업데이트
            updateMarkers(); // 마커 업데이트
        });
    });
}

function updateMarkers() {
    markers.forEach(marker => marker.setMap(null)); // 지도에서 모든 마커 제거
    markers = []; // 마커 배열 초기화

    selectedPlaces.forEach((place, index) => {
        const markerLabel = (index + 1).toString();
        const marker = new google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            label: markerLabel,
            map: map.innerMap
        });

        markers.push(marker); // 마커 배열에 추가

        marker.addListener('click', () => {
            infowindow.setContent(`<strong>${place.placeName}</strong>`);
            infowindow.open(map.innerMap, marker);
        });
    });
}

function resetSelectedPlaces() {
    selectedPlaces = [];
    updateSelectedPlaces();
    updateMarkers(); // 마커도 함께 지워짐
}

function changePlaceType(type) {
    const buttons = document.querySelectorAll('.category-buttons button');
    buttons.forEach(button => button.classList.remove('active')); // 모든 버튼의 'active' 클래스 제거
    event.target.classList.add('active'); // 클릭한 버튼에 'active' 클래스 추가

    const foodInputContainer = document.getElementById('foodInputContainer');
    const foodInput = document.getElementById('foodInput');
    const food = foodInput.value;

    // 식당 카테고리를 선택했을 때만 음식 검색 입력 필드를 표시
    if (type === 'restaurant') {
        foodInputContainer.style.display = 'flex';
        if (food === '') {
            searchNearbyPlaces(marker.position, 'restaurant'); // 리뷰 순으로 식당 검색
        } else {
            searchNearbyPlaces(marker.position, 'restaurant', food); // 음식 종류로 검색
        }
    } else {
        foodInputContainer.style.display = 'none';
        searchNearbyPlaces(marker.position, type);
    }
}

document.addEventListener('DOMContentLoaded', init);

// 음식 검색 함수
function searchFood() {
    const food = document.getElementById("foodInput").value;
    const place = marker.position;
    if (!place) return;
    searchNearbyPlaces(place, 'restaurant', food); // 음식 종류와 함께 검색
}

// 음식 검색 초기화 함수 추가
function resetFoodSearch() {
    document.getElementById('foodInput').value = ''; // 음식 검색창 초기화
    searchNearbyPlaces(marker.position, 'restaurant'); // 리뷰 순으로 식당 검색
}function openPlanPopup() {
    const modal = document.getElementById('plan-popup');
    modal.style.display = 'block';

    fetch('/plans', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요하다면 헤더에 추가
        }
    })
        .then(response => response.json())
        .then(plans => {
            displayPlanTitles(plans);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function closePlanPopup() {
    const modal = document.getElementById('plan-popup');
    modal.style.display = 'none';
}

function displayPlanTitles(plans) {
    const planList = document.getElementById('plan-list');
    planList.innerHTML = ''; // 기존 목록 초기화

    plans.forEach(plan => {
        const li = document.createElement('li');
        li.classList.add('plan-title-item');
        li.textContent = plan.title;
        li.style.cursor = 'pointer';

        // 계획 제목 클릭 시 이벤트 처리
        li.addEventListener('click', () => {
            // 팝업 닫기
            closePlanPopup();
            // 선택한 계획의 장소들을 불러와서 표시
            viewPlan(plan.id);
        });

        planList.appendChild(li);
    });
}

function viewPlan(planId) {
    fetch(`/plans/${planId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요하다면 헤더에 추가
        }
    })
        .then(response => response.json())
        .then(plan => {
            console.log('선택한 계획:', plan);
            // 선택한 계획의 장소들로 지도와 패널 업데이트
            selectedPlaces = plan.places.map(place => ({
                placeName: place.placeName,
                lat: place.lat,
                lng: place.lng
            }));
            updateSelectedPlaces();
            updateMarkers();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('plan-popup');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
