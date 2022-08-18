
// import icons from '../img/icons.svg'; //Parcel 1
import * as model from './model.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime'
import { async } from 'regenerator-runtime';

if(module.hot){
  module.hot.accept()
}


const controlRecepies = async function(){
  try{

     const id = window.location.hash.slice(1);
      if(!id) return;

      recipeView.renderSpinner();
      //0) Update results view to mark 
      resultsView.update(model.getSearchResultsPage());

       //1)updating bookmarks view
       bookmarksView.update(model.state.bookmarks);
      
      // 2) Loading recipe 
      await model.loadRecipe(id);
      
      //3) Rendering recipe
      //after loading recipe we render view with that loaded recipe 
      recipeView.render(model.state.recipe);
      
     
  }catch(err){

    recipeView.renderError()
    //function has no parameter so it will be called with default parameter thats at private field #errorMessage
  };
};

const controlSearchResults = async function(){
  try{

    resultsView.renderSpinner();
    //1)Get search query
    //taking input from view search
    const query = searchView.getQuery();
    if(!query) return;
    searchView._clearInput()
    //2) Load search results
    //connect model with input,load objects into array
    await model.loadSerchResults(query)
    //3) Render results
    //we render the view with loaded array of objects
    resultsView.render(model.getSearchResultsPage());

    //Render initial pagination buttons 

      paginationView.render(model.state.search)

  }catch(err){
      console.log(err)
  }
};


const controlPagination = function(goToPage){

   //3) Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    //Render NEW pagination buttons 
    paginationView.render(model.state.search)
};


const controlServings = function(newServings){
  //Update the recipe servings (in state)
      model.updateServings(newServings)
  //Update the recipe view
    recipeView.update(model.state.recipe);
};


const controlAddBookmark = function(){
  //Add or remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
//Update recipe view
  recipeView.update(model.state.recipe);
  //Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){

  try{

    //Show loading spinner

    addRecipeView.renderSpinner();
    //upload new recipe data

      //newRecipe is a data from addHandlerUpload
      await model.uploadRecipe(newRecipe);
      console.log(model.state.recipe)

      //Render recipe 
      recipeView.render(model.state.recipe);

      //Display success message
      addRecipeView.renderMessage();

      //Render bookmark view
      bookmarksView.render(model.state.bookmarks);

      //Change ID in URL
      window.history.pushState(null,'',`#${model.state.recipe.id}`) 

      //Close form window
      setTimeout(function(){
        addRecipeView.toggleWindow();
      },MODAL_CLOSE_SEC * 1000);

  }catch(err){
    console.log(err);
    addRecipeView.renderError(err.message)
  }

  
}


//They are events handlers (control functions here)
//Publisher subscriber pattern.Moving function from view to handle it in the controller and passing it as an argument
const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecepies)
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
 
};




init();
 //kontrolowanie tego co view ma zrobic za pomocą funkcji z kontrolera - nadac add event listener na element nalezacy do danego view. 