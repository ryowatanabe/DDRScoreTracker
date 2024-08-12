import globals from "globals";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";


export default [
	{
		// 1. ルールの対象を glob pattern で指定できるようになりました。
		files: ["src/**/*.js", "src/**/*.vue"],
		languageOptions: {
			parser: vueParser,
			// 2. env オプションは無くなり、代わりに globals を使用するようになりました。
			globals: {
				...globals.browser,
				...globals.webextensions,
                ...globals.es2020
			},
			// eslintrc の parserOptions と同じです。
			parserOptions: {
				ecmaVersion: 2020
			},
		},
  		// 3. plugin は名称を指定できるようになりましたが、注意があります。
		plugins: {
			vuePlugin
		},
		// rule の書き方は基本的に同じです。
		rules: {
            "no-unused-vars": [
                "error",
                {
                  "args": "after-used",
                  "argsIgnorePattern": "^_"
                }
              ]
		}
	}
]