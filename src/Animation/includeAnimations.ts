


export function includeAnimations() {
    let spinWebkit = `@-webkit-keyframes mentatjsSpin {
    from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}`;

    let spin = `@keyframes mentatjsSpin {
  from {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(359deg);
    transform: rotate(359deg);
  }
}`;

    let cssClass = `.mentatjs-spin {
    animation: mentatjsSpin 2s linear 0s infinite;
    }`;


    let css = spin + "\r\n" + spinWebkit + "\r\n" + cssClass;

    let head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    head.appendChild(style);
    style.type = 'text/css';
    style.title = "MentatJS Animations"
    style.appendChild(document.createTextNode(css));




}
