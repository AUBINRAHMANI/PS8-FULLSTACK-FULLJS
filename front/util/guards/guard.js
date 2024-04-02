import {isTokenValid} from "../jwtParser.js";
import {LOGIN_URL} from "../path.js";
import {BASE_URL_PAGE} from "../frontPath.js";



  window.onload = () => {
      let token = localStorage.getItem("token");
      if (token === null || !isTokenValid(token)) {
          window.location.replace(BASE_URL_PAGE + LOGIN_URL)
      }
 }

// The URL is considered valid if it ends with a '/' or a '?' because we use automatic search for 'index.html' pages
// Forgetting to include '/' can result in JS and CSS files not being found
