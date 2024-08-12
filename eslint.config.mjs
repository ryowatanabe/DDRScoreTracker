import globals from "globals";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
	{
		files: ["src/**/*.js", "src/**/*.vue"],
		languageOptions: {
			parser: vueParser,
			globals: {
				...globals.browser,
				...globals.webextensions,
                ...globals.es2020
			},
			parserOptions: {
				ecmaVersion: 2020
			},
		},
		plugins: {
			vuePlugin
		},
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