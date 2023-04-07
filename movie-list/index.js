const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = [];
let filterMovies = [];
let cardType = localStorage.getItem("card-type");
let currentlyPage = 1;

const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#inlineFormInputGroupUsername");
const cardTypeButton = document.querySelector("#card-type-button");

function renderMovieList(data) {
  let rawHTML = "";

  //檢查card-type
  if (cardType === "type-list") {
    rawHTML += `<table class="table">
  <thead>
    <tr>
      <th scope="col">Movie</th>
      <th></th>
    </tr>
  </thead>
  <tbody>`;
    data.forEach(item => {
      rawHTML += `
    <tr>
      <td>${item.title}</td>
      <td><button class="btn btn-primary btn-show-movie mx-1" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button><button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button></td>
    </tr>
  `;
    });
    rawHTML += `</tbody>
</table>`;
    dataPanel.innerHTML = rawHTML;
  } else {
    data.forEach(item => {
      // title, image
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImg = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then(res => {
    const data = res.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImg.innerHTML = `<img
                  src="${POSTER_URL + data.image}"
                  alt="movie-poster"
                  class="img-fluid"
                />`;
  });
}

function getMoviesByPage(page) {
  //movies ? "movies" : "filteredMovies"

  const data = filterMovies.length ? filterMovies : movies;

  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = `<li class="page-item"><a class="page-link active" href="#" data-page="1" >1</a></li>`;
  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}" >${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function addToFavorite(id) {
  //取出清單，原資料為JSON string 要用JSON.parse還原成object
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  //從movies抓出movie
  const movie = movies.find(movie => movie.id === id);
  //檢查ID是否在清單內
  if (list.some(movie => movie.id === id)) {
    return alert("電影已在蒐藏清單");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

paginator.addEventListener("click", function onPaginatorClick(event) {
  if (event.target.tagName !== "A") return;
  const activedPaginator = document.querySelector("#paginator .active");
  activedPaginator.classList.remove("active");
  event.target.parentElement.setAttribute("class", "active");

  currentlyPage = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(currentlyPage));
});

dataPanel.addEventListener("click", function onPanelClick(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  //判斷keyword
  // if (!keyword.length) {
  //   return alert("請輸入關鍵字");
  // }

  filterMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filterMovies.length === 0) {
    return alert("沒有找到電影");
  }
  renderPaginator(filterMovies.length);
  renderMovieList(getMoviesByPage(1));
});

cardTypeButton.addEventListener("click", function onCardType(event) {
  //更新localStorage上的card-type後，更新cardType再渲染網頁
  if (event.target.id === "type-list") {
    localStorage.setItem("card-type", "type-list");
  } else {
    localStorage.setItem("card-type", "type-card");
  }
  cardType = localStorage.getItem("card-type");
  renderMovieList(getMoviesByPage(currentlyPage));
});

axios
  .get(INDEX_URL)
  .then(res => {
    movies.push(...res.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch(err => console.log(err));
