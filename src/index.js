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

//================
const galleryWrap = document.querySelector('.gallery-wrap');
//===============

refs.form.addEventListener('submit', onClickFormSearch);
window.addEventListener("scroll", throttle(infiniteScroll, 300));

// refs.gallery.insertAdjacentHTML('beforebegin', spinnerMarkup);

//===============
galleryWrap.insertAdjacentHTML('afterend', spinnerMarkup);
//===============


const prelaoder = document.querySelector('.spinner-wrap');
//for infiniteScroll=======
let shouldLoad = false;
//=========================

//========================
let loaded = false;
//=======================

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
    refs.body.classList.add('padding-right');
    prelaoder.classList.add('full-screen');
    fetchGallery.resetPage();
    fetchGallery.resetLoadedHits();
    clearGalleryMarkup();
    createGalleryMarkup();
};

function infiniteScroll() {
    const height = document.body.offsetHeight;
    const scrollY = Math.ceil(window.scrollY);
    const clientHeight = window.innerHeight;
    const scroll = clientHeight + scrollY;

    const threshold = height - clientHeight; //======

    if (scrollY === 0) {
        return;
    };

    if (scroll >= threshold && shouldLoad && !loaded) {
        prelaoder.classList.remove('full-screen');
        // refs.body.classList.add('overflow');
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
            // refs.body.classList.remove('overflow');
            return;
        };

        //=============
        const galleryX = document.querySelector(`.gallery-${fetchGallery.page-1}`);
        galleryX.classList.add('is-hidden');
        //============

        prelaoder.classList.remove('is-hidden');
        fetchGallery.incrementHits(hits);
        const markup = gallery.hits.map(card => galleryMarkup(card)).join('');
        // refs.gallery.insertAdjacentHTML('beforeend', markup);

        //=======================
        galleryX.insertAdjacentHTML('beforeend', markup);

        loaded = true;
        //=======================

        lightbox.refresh();
        showLoading(hits.length, galleryX);
        //=========
        incrementDiv();
        //=========
    } catch (error) {
        console.log(error);
    };
};

//===============
function incrementDiv() {
    const divXt = `<div class="gallery-x gallery-${fetchGallery.page}"></div>`;

    const galleryDivX = document.querySelector(`.gallery-${fetchGallery.page-1}`);

    galleryDivX.insertAdjacentHTML('afterend', divXt);

    galleryDivX.classList.add('is-hidden');
};
//================

function clearGalleryMarkup() {
    while (refs.gallery.firstChild) {
        refs.gallery.removeChild(refs.gallery.lastChild);
    };
    //==================
    const container = document.querySelector('.gallery-wrap');
    const items = [...container.children];
    const index = items.findIndex(n => n.id === 'point');
    items.slice(index + 1).forEach(n => container.removeChild(n));
    //===================
};

function showLoading(hits, galleryX) {
    let imgArray = [];
    const imagesAll = document.querySelectorAll('img');
    imagesAll.forEach(function(img) {
        img.addEventListener('load', () => {
            imgArray.push(img.complete);
            const check = imgArray.every(elem => elem === true);
            if (imgArray.length === hits && check === true) {
                prelaoder.classList.add('loaded_hiding');
                setTimeout(() => {
                    prelaoder.classList.add('is-hidden');
                    prelaoder.classList.remove('loaded_hiding');
                }, 300);
                refs.body.classList.remove('padding-right');
                galleryX.classList.remove('is-hidden'); //===
                loaded = false; //===
                shouldLoad = true;
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