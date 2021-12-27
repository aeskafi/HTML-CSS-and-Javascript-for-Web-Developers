$(function () {
	$("#navbarToggle").blur(function (event) {
		var screenWidth = window.innerWidth;
		if (screenWidth < 768) {
			$("#navbarSupportedContent").collapse('hide');
		}
	});
});

(function (global) {
	var dc = {};

	var homeHtml = "./snippets/home-snippet.html";
	var allCategoriesURL = "https://davids-restaurant.herokuapp.com/categories.json";
	var categoriesTitleHtml = "./snippets/categories-title-snippet.html";
	var categoryHtml = "./snippets/category-snippet.html";
	var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var menuItemsTitleHtml = "./snippets/menu-items-title.html";
	var menuItemHtml = "./snippets/menu-item.html";

	// Convenience function for inserting innerHTML for 'select'
	var insertHtml = function (selector, html) {
		var targetElem = document.querySelector(selector);
		targetElem.innerHTML = html;
	};

	// Show loading icon inside element identified by 'selector'
	var showLoading = function (selector) {
		var html = "<div class='text-center'>";
		html += "<img src='images/ajax-loader.gif'></div>";
		insertHtml(selector, html)
	};

	// Return substitute (replace) of '{{propName}}'
	// with propValue inn given 'string'
	var insertProperty = function (string, propName, propValue) {
		var propToReplace = "{{" + propName + "}}";
		string = string.replace(new RegExp(propToReplace, "g"), propValue);
		return string;
	};

	// On page load (before images or CSS)
	document.addEventListener("DOMContentLoaded", function (event) {
		// On first load show home view
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(homeHtml, function (responseText) {
			var res = insertProperty(responseText,
				"randomCategoryShortName",
				randomCategoryShortName());
			document.querySelector("#main-content").innerHTML = res;
		}, false);
	});

	// Remove the class 'active' from the home and switch to Menu Button
	var switchMenuToActive = function () {
		// Remove 'active' from home button
		var classes = document.querySelector("#navHomeButton").className;
		classes = classes.replace(new RegExp("active", "g"), "");
		document.querySelector("#navHomeButton").className = classes;

		// Add 'active' to menu button if not already there
		classes = document.querySelector("#navMenuButton").className;
		if (classes.indexOf("active") == -1) {
			classes += " active";
			document.querySelector("#navMenuButton").className = classes;
		}
	}

	var randomCategoryShortName = function () {
		var menu = ["A", "B", "C", "C2", "CM", "CSR", "CU", "D",
			"DK", "DS", "F", "FR", "FY", "L", "NF", "NL",
			"NS", "PF", "SO", "SP", "SR", "SS", "T", "V", "VG"];
		return menu[Math.floor(Math.random() * menu.length)];
	}

	// Load the menu categories view
	dc.loadMenuCategories = function () {
		showLoading('#main-content');
		$ajaxUtils.sendGetRequest(
			allCategoriesURL,
			buildAndShowCategoriesHTML);
	};

	// Load the menu items view
	// 'categoryShort' is a short_name for a category
	dc.loadMenuItems = function (categoryShort) {
		showLoading('#main-content');
		$ajaxUtils.sendGetRequest(
			menuItemsUrl + categoryShort,
			buildAndShowMenuItemsHTML);
	};

	// Builds HTML for the categories page based on the data
	// from the server
	function buildAndShowCategoriesHTML(categories) {
		// Load title snippet of categories page
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml,
			function (categoriesTitleHtml) {
				// Retrieve single category snippet
				$ajaxUtils.sendGetRequest(
					categoryHtml,
					function (categoryHtml) {
						var categoriesViewHtml =
							buildCategoriesViewHtml(categories,
								categoriesTitleHtml,
								categoryHtml);
						insertHtml('#main-content', categoriesViewHtml);
					},
					false);
			},
			false);
	}

	// Using categories data and snippet html
	// build categories view HTML to be inserted into page
	function buildCategoriesViewHtml(categories,
		categoriesTitleHtml,
		categoryHtml) {
		var finalHtml = categoriesTitleHtml;
		finalHtml += "<section class='row'>";

		// Loop over categories
		for (var i = 0; i < categories.length; i++) {
			// Insert category values
			var html = categoryHtml;
			var name = "" + categories[i].name;
			var short_name = categories[i].short_name;
			html = insertProperty(html, "name", name);
			html = insertProperty(html, "short_name", short_name);
			finalHtml += html;

		}
		finalHtml += "</section>";
		return finalHtml;
	}

	// Builds HTML for the single category page based on he data
	// from the server
	function buildAndShowMenuItemsHTML(categoryMenuItems) {
		// Load title snippet of menu items page
		$ajaxUtils.sendGetRequest(
			menuItemsTitleHtml,
			function (menuItemsTitleHtml) {
				// Retrieve single menu item snippet
				$ajaxUtils.sendGetRequest(
					menuItemHtml,
					function (menuItemHtml) {
						var menuItemsViewHtml =
							buildMenuItemsViewHtml(categoryMenuItems,
								menuItemsTitleHtml,
								menuItemHtml);
						insertHtml('#main-content', menuItemsViewHtml);
					},
					false);
			},
			false);
	}

	// Using category and menu items data and snippets html
	// build menu items view HTML to be inserted into page
	function buildMenuItemsViewHtml(categoryMenuItems,
		menuItemsTitleHtml,
		menuItemHtml) {
		menuItemsTitleHtml =
			insertProperty(menuItemsTitleHtml,
				'name',
				categoryMenuItems.category.name);
		menuItemsTitleHtml =
			insertProperty(menuItemsTitleHtml,
				'special_instructions',
				categoryMenuItems.category.special_instructions);
		var finalHtml = menuItemsTitleHtml;
		finalHtml += "<section class='row'>";

		// Loop over categories
		var menuItems = categoryMenuItems.menu_items;
		var catShortName = categoryMenuItems.category.short_name;
		for (var i = 0; i < menuItems.length; i++) {
			// Insert menu item values
			var html = menuItemHtml;
			html = insertProperty(html, 'short_name', menuItems[i].short_name);
			html = insertProperty(html, 'catShortName', catShortName);
			html = insertItemPrice(html, 'price_small', menuItems[i].price_small);
			html = insertItemPortionName(html, 'small_portion_name',
				menuItems[i].small_portion_name);
			html = insertItemPrice(html, 'price_large', menuItems[i].price_large);
			html = insertItemPortionName(html, 'large_portion_name',
				menuItems[i].large_portion_name);
			html = insertProperty(html, 'name', menuItems[i].name);
			html = insertProperty(html, 'description', menuItems[i].description);

			// Add clearfix after every second menu item
			if (i % 2 != 0) {
				html +=
					"<div class='clearfix d-block d-lg-none'></div>";
			}

			finalHtml += html;
		}
		finalHtml += "</section>";
		return finalHtml;
	}

	// Append price with '$' if price exist
	function insertItemPrice(html, pricePropName, priceValue) {
		// if not specified, replace with empty string
		if (!priceValue) return insertProperty(html, pricePropName, "");
		priceValue = "$" + priceValue.toFixed(2);
		html = insertProperty(html, pricePropName, priceValue);
		return html;
	}

	// Append portion name in parens if it exist
	function insertItemPortionName(html, portionPropName, portionValue) {
		// if not specified, replace with empty string
		if (!portionValue) return insertProperty(html, portionPropName, "");
		html = insertProperty(html, portionPropName, portionValue);
		return html;
	}

	global.$dc = dc;
})(window);
