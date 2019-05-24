import { Router } from '@vaadin/router';

const router = new Router(document.querySelector('main'));
router.setRoutes([
  { path: '/', component: 'app-home' }
]);
