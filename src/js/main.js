async function createGalleryMarkup() {
    const gallery = await fetchGallery.fetchQuery();
    const totalHits = gallery.totalHits;
    let hits = gallery.hits.length;
    hits += hits;
    try {
        if (hits === 0) {
            Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            return;
        };
        if (hits === totalHits) {
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            shouldLoad = false;
            console.log(shouldLoad);
            return;
        };
        const markup = gallery.hits.map(card => galleryMarkup(card)).join('');
        refs.gallery.insertAdjacentHTML('beforeend', markup);
        lightbox.refresh();
    } catch (error) {
        console.log(error);
    };
};