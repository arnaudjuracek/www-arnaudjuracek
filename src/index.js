import Views from 'libs/views.js';
import cursorsManager from 'libs/cursorsManager.js';

const views = Views();

const cm = cursorsManager();
cm.initSyncBrowsing(views);