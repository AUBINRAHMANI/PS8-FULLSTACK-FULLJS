
import {isTokenValid} from "../jwtParser.js";
import {HOME_URL, LOGIN_URL} from "../path.js";
import {BASE_URL_PAGE} from "../frontPath.js";



  window.onload = () => {
      let token = localStorage.getItem("token");
      if (token !== null && isTokenValid(token)) {
          window.location.href = BASE_URL_PAGE + HOME_URL;
      }
  }
