import axios from "axios";

export default class QueryAPI {
    constructor() {
        this.searchQuery = '';
        this.page = 1;
        this.perPage = 20;
        this.loadedHits = 0;
    }

    async fetchQuery() {
        const URL = `https://pixabay.com/api/?q=${this.searchQuery}&image_type=photo&safesearch=true&page=${this.page}&per_page=${this.perPage}`;
        const API_KEY = '33752530-4b24ec44329786fc732f0a267';
        const response = axios.get(URL, {
            params: {
                key: API_KEY
            }
        })
        const gallery = await response;
        this.incrementPage();
        return gallery.data;
    }

    incrementPage() {
        this.page += 1;
    }

    resetPage() {
        this.page = 1;
    }

    incrementHits(hits) {
        this.loadedHits += hits.length;
    }

    resetLoadedHits() {
        this.loadedHits = 0;
    }

    get query() {
        return this.searchQuery;
    }

    set query(newQuery) {
        this.searchQuery = newQuery;
    }
}