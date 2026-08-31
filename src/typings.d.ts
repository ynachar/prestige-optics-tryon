declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.html' {
  const content: string;
  export default content;
}

interface Element {
  style: CSSStyleDeclaration;
}

interface HTMLElement {
  src: string;
  value: string;
}

declare var XDomainRequest: {
  new (): XMLHttpRequest;
};
