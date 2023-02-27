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

let shouldLoad = true; //for infiniteScroll

const fetchGallery = new QueryAPI();
let lightbox = new SimpleLightbox('.photo-card a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
});

function onClickFormSearch(e) {
    e.preventDefault();
    shouldLoad = true;
    fetchGallery.query = e.currentTarget.elements.searchQuery.value.trim();
    if (fetchGallery.query === '') {
        Notiflix.Notify.failure('You need to enter what we want to find');
        return;
    }
    fetchGallery.resetPage();
    fetchGallery.resetHits();
    clearGalleryMarkup();
    createGalleryMarkup();
};

function infiniteScroll() {
    const scrollHeight = refs.gallery.offsetHeight;
    const scrollY = window.pageYOffset;
    const clientHeight = window.innerHeight;
    const scroll = clientHeight + scrollY;

    if (scroll >= scrollHeight && shouldLoad) {
        createGalleryMarkup();
    }
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
            fetchGallery.resetHits();
            return;
        };
        prelaoder.classList.remove('is-hidden');
        refs.body.classList.add('overflow')
        fetchGallery.incrementHits(hits);
        const markup = gallery.hits.map(card => galleryMarkup(card)).join('');
        refs.gallery.insertAdjacentHTML('beforeend', markup);
        lightbox.refresh();
        showLoading(hits.length);
        console.log(hits.length);
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
                prelaoder.classList.add('is-hidden');
                refs.body.classList.remove('overflow')
            };
        });
    });
};

function smoothScrollGallery() {
    const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 1,
        behavior: "smooth",
    });
};