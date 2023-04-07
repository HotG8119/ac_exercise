const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";

const friends = [];
let filterFriends = [];
let bestFriends = JSON.parse(localStorage.getItem("bestFriends")) || [];

const FRIENDS_PER_PAGE = 8;
const cardContainer = document.querySelector("#card-container");
const paginator = document.querySelector("#paginator");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE);
  let rawHTML = `<li class="page-item"><a class="page-link active" href="#" data-page="1" >1</a></li>`;
  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}" >${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getFriendsByPage(page) {
  //檢查 filterFriends 是否有值
  const data = filterFriends.length ? filterFriends : friends;

  const startIndex = (page - 1) * FRIENDS_PER_PAGE;
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE);
}

function renderFriendCards(data) {
  let rawHTML = "";
  data.forEach(item => {
    rawHTML += `
    <div class="position-relative">
    <div type="button" class="card m-2 rounded-3 border-secondary position-relative position-relative" style="width: 18rem" data-bs-toggle="modal" data-bs-target="#friend-modal" data-id="${item.id}";>
    <img src=${item.avatar} alt="avatar.img">
    <p class="card-text text-center mt-2 mb-2">${item.name}</p>
    
  </div>
  <i class="fa-solid fa-heart position-absolute top-0 end-0" id="heart" data-id="${item.id}"></i>
  </div>
  `;
  });
  cardContainer.innerHTML = rawHTML;
}

function showFriendModal(id) {
  const friendImg = document.querySelector("#friend-modal-img");
  const friendName = document.querySelector("#friend-modal-name");
  const friendGender = document.querySelector("#friend-modal-gender");
  const friendBirth = document.querySelector("#friend-modal-birth");
  const friendReigon = document.querySelector("#friend-modal-region");
  const friendEmail = document.querySelector("#friend-modal-email");

  axios.get(INDEX_URL + id).then(res => {
    const data = res.data;
    friendName.innerText = data.name + " " + data.surname;
    friendGender.innerText = "gender: " + data.gender;
    friendBirth.innerText = "birth: " + data.birthday + " age: " + data.age;
    friendReigon.innerText = "region: " + data.region;
    friendEmail.innerText = "email: " + data.email;
    friendImg.innerHTML = `<img src="${data.avatar}" alt="" class="img-fluid">`;
  });
}

function add2Best(id) {
  //從local取出資料或是空陣列
  const friend = friends.find(friend => friend.id === id);
  if (bestFriends.some(friend => friend.id === id)) {
    return alert("已加入摯友");
  }

  bestFriends.push(friend);
  localStorage.setItem("bestFriends", JSON.stringify(bestFriends));
}

// 監聽卡片
cardContainer.addEventListener("click", event => {
  const friendId = Number(event.target.parentElement.dataset.id);
  if (event.target.id === "heart") {
    add2Best(Number(event.target.dataset.id));
  } else {
    showFriendModal(friendId);
  }
});

// 頁次
paginator.addEventListener("click", function onPageClick(event) {
  if (event.target.tagName !== "A") return;

  //reset paginator active
  const activedPaginator = document.querySelector("#paginator .active");
  activedPaginator.classList.remove("active");
  event.target.parentElement.setAttribute("class", "active");

  const page = Number(event.target.dataset.page);
  renderFriendCards(getFriendsByPage(page));
});

// 搜尋欄
searchForm.addEventListener("submit", function onSearchFromSubmit(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filterFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(keyword)
  );

  if (filterFriends.length === 0) {
    return alert("沒有找到朋友");
  }

  renderPaginator(filterFriends.length);
  renderFriendCards(getFriendsByPage(1));
});

axios
  .get(INDEX_URL)
  .then(res => {
    friends.push(...res.data.results);
    renderPaginator(friends.length);
    renderFriendCards(getFriendsByPage(1));
  })
  .catch(err => console.log(err));
