
import * as model from './model.js';
import {MODEL_CLOSE_SEC} from './config.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import bookmarksView from './views/bookmarksView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';



import 'core-js/stable'; //filling anything else
import 'regenerator-runtime/runtime'; //filling async/await
import { async } from 'regenerator-runtime';


// const recipeContainer = document.querySelector('.recipe');

//From Parcel
// if(module.hot){
//   module.hot.accept();
// }

///////////////////////////////////////

// # = truly private
// _ = only protected
//aysnc function will return promise that we then need to handle whenever we call async function

const controlRecipes = async function() {
  try{

    const id = window.location.hash.slice(1);
    //console.log(id);

    if(!id) return;
    recipeView.renderSpinner(); 

     // 0) Update results view to mark selected search result
     resultsView.update(model.getSearchResultsPage());
  
     // 1) Update bookmark view
    bookmarksView.update(model.state.bookmarks);

     // 2) Loading recipe
     await model.loadRecipe(id);
     
    // 3)  Rendering recipe
    recipeView.render(model.state.recipe);

    


  } catch(err){
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function() {
  try{
    resultsView.renderSpinner();


    // 1) Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    //console.log(model.state.search.results);
    //resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage());

    // 4 Render initial pagination button
    paginationView.render(model.state.search);
  } catch(err){
    console.error(err);
  };
};

const controlPagination = function(goToPage) {
  // 1) Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2) Render NEW pagination button
    paginationView.render(model.state.search);
  };
  

  const controlServings = function(newServings) {
    //Update the recipe servings (in state)
    model.updateServings(newServings);

    // Update the recipe view
    //recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);

  }

  const controlAddBookmark = function(){
    // 1) Add/Remove bookmark
    if(!model.state.recipe.bookmarked) 
      model.addBookmark(model.state.recipe);
    else 
      model.deleteBookmark(model.state.recipe.id);

    // 2) Update recipe view
    recipeView.update(model.state.recipe); 
    //we have to pass it data that we want to update

    // 3) Render bookmarks
    bookmarksView.render(model.state.bookmarks)

  }

  const controlBookmarks = function(){
    bookmarksView.render(model.state.bookmarks)

  }

  const controlAddRecipe = async function(newRecipe){
    //console.log(newRecipe);
    try{
      //Show loading spinner
      addRecipeView.renderSpinner();


    // Upload the new recipe data 
      await model.uploadRecipe(newRecipe); //to see array that we will work with now to fill ingredients
      console.log(model.state.recipe);

      //Render recipe
      recipeView.render(model.state.recipe);

      //Success message
      addRecipeView.renderMessage();

      // Render bookmark view
      bookmarksView.render(model.state.bookmarks);

      //Change ID in URL 
      window.history.pushState(null, '', `#${model.state.recipe.id}`);
    

      // Close form window (toggle)
      setTimeout(function() {
        addRecipeView.toggleWindow()
      }, MODEL_CLOSE_SEC * 1000);

    }catch(err) {
      console.error('🧨🧨', err);
      addRecipeView.renderError(err.message);
    }
   
  };

//Event is listened for in addHandlerRender but handler here
const init = function() {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServing(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);


}
init();
//['hashchange', 'load'].forEach(ev => window.addEventListener(ev, controlRecipes))
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);