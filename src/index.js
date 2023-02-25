import QueryAPI from "./js/query";
import galleryMarkup from "./js/gallery-markup";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import { spinnerMarkup } from "./js/spinner-markup";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onClickFormSearch);
refs.loadMore.addEventListener('click', onClickLoadMore);

refs.gallery.insertAdjacentHTML('beforebegin', spinnerMarkup);
const prelaoder = document.querySelector('.spinner-wrap');

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
        Notiflix.Notify.failure('First you need to enter what we want to find');
        return;
    }
    prelaoder.classList.remove('is-hidden');
    fetchGallery.resetPage();
    createGalleryMarkup();
};

async function createGalleryMarkup() {
    const response = fetchGallery.fetchQuery();
    const gallery = await response;
    try {
        if (gallery.hits.length === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            return;
        };
        const markup = gallery.hits.map(card => galleryMarkup(card)).join('');
        clearGalleryMarkup();
        refs.gallery.insertAdjacentHTML('beforeend', markup);
        refs.loadMore.classList.remove('is-hidden');
        lightbox.refresh();
        insertGalleryPreloader();
    } catch (error) {
        console.log(error);
    };
};

function onClickLoadMore() {
    fetchGallery.fetchQuery()
        .then(({ hits, totalHits }) => {
            if (hits.length === 0) {
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
                refs.loadMore.classList.add('is-hidden');
                return;
            }
            const markup = hits.map(card => galleryMarkup(card)).join('');
            refs.gallery.insertAdjacentHTML('beforeend', markup);
            smoothScrollGallery();
            lightbox.refresh();
        });
};

function clearGalleryMarkup() {
    while (refs.gallery.firstChild) {
        refs.gallery.removeChild(refs.gallery.lastChild);
    };
};

function insertGalleryPreloader() {
    let array = [];
    const images = document.querySelectorAll('img');
    images.forEach(function(img) {
        img.addEventListener('load', () => {
            array.push(img.complete);
            const check = array.every(elem => elem === true);
            if (array.length === images.length && check === true) {
                prelaoder.classList.add('is-hidden');
            };
        });
    });
};

function smoothScrollGallery() {
    const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
};