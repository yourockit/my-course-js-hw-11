import QueryAPI from "./js/query";
import galleryMarkup from "./js/gallery-markup";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import throttle from "lodash.throttle";
import { spinnerMarkup } from "./js/spinner-markup";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    body: document.querySelector('body'),
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
};

refs.form.addEventListener('submit', onClickFormSearch);
window.addEventListener("scroll", throttle(infiniteScroll, 300));

refs.gallery.insertAdjacentHTML('beforebegin', spinnerMarkup);
const prelaoder = document.querySelector('.spinner-wrap');
//for infiniteScroll=======
let shouldLoad = true;
//=========================
const fetchGallery = new QueryAPI();
let lightbox = new SimpleLightbox('.photo-card a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
});

function onClickFormSearch(e) {
    e.preventDefault();
    fetchGallery.query = e.currentTarget.elements.searchQuery.value.trim();
    if (fetchGallery.query === '') {
        Notiflix.Notify.failure('You need to enter what we want to find');
        return;
    };
    prelaoder.classList.add('full-screen');
    refs.body.classList.add('overflow')
    shouldLoad = true;
    fetchGallery.resetPage();
    fetchGallery.resetLoadedHits();
    clearGalleryMarkup();
    createGalleryMarkup();
};

function infiniteScroll() {
    const scrollHeight = document.body.offsetHeight;
    const scrollY = Math.ceil(document.documentElement.scrollTop);
    const clientHeight = window.innerHeight;
    const scroll = clientHeight + scrollY;

    if (scrollY === 0) {
        return;
    };

    if (scroll >= scrollHeight && shouldLoad) {
        prelaoder.classList.remove('full-screen');
        refs.body.classList.add('overflow')
        createGalleryMarkup();
    };
};

async function createGalleryMarkup() {
    const gallery = await fetchGallery.fetchQuery();
    const totalHits = gallery.totalHits;
    const hits = gallery.hits;
    try {
        if (totalHits === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            clearGalleryMarkup();
            return;
        };
        if (fetchGallery.loadedHits === totalHits) {
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            shouldLoad = false;
            return;
        };
        prelaoder.classList.remove('is-hidden');
        fetchGallery.incrementHits(hits);
        const markup = gallery.hits.map(card => galleryMarkup(card)).join('');
        refs.gallery.insertAdjacentHTML('beforeend', markup);
        lightbox.refresh();
        showLoading(hits.length);
    } catch (error) {
        console.log(error);
    };
};

function clearGalleryMarkup() {
    while (refs.gallery.firstChild) {
        refs.gallery.removeChild(refs.gallery.lastChild);
    };
};

function showLoading(hits) {
    let imgArray = [];
    const imagesAll = document.querySelectorAll('img');
    imagesAll.forEach(function(img) {
        img.addEventListener('load', () => {
            imgArray.push(img.complete);
            const check = imgArray.every(elem => elem === true);
            if (imgArray.length === hits && check === true) {
                prelaoder.classList.add('loaded_hiding')
                setTimeout(() => {
                    prelaoder.classList.add('is-hidden');
                    prelaoder.classList.remove('loaded_hiding');
                }, 500);
                refs.body.classList.remove('overflow')
            };
        });
    });
};

// function smoothScrollGallery() {
//     const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

//     window.scrollBy({
//         top: cardHeight * 1,
//         behavior: "smooth",
//     });
// };