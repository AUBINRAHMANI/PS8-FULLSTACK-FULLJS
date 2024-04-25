import {isTokenValid} from "../jwtParser.js";
import {LOGIN_URL} from "../path.js";
import {BASE_URL_PAGE} from "../frontPath.js";



  window.onload = () => {
      let token = localStorage.getItem("token");
      if (token === null || !isTokenValid(token)) {
          window.location.replace(BASE_URL_PAGE + LOGIN_URL)
      }
 }


