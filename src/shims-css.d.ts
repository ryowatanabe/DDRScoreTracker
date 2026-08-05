// moduleResolution: "bundler" では CSS の side-effect import に
// 型宣言が必要になる (TS2882)。実際のバンドルは webpack の
// css-loader / postcss-loader が処理する。
declare module '*.css';
