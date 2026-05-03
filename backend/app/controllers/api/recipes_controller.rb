module Api
  class RecipesController < ApplicationController
    before_action :set_recipe, only: %i[show update destroy]

    def index
      recipes = Recipe.all

      if params[:keyword].present?
        recipes = recipes.where("title LIKE ?", "%#{params[:keyword]}%")
      end

      if params[:category].present?
        recipes = recipes.where(category: params[:category])
      end

      recipes = case params[:sort]
                when "name_asc"
                  recipes.order(title: :asc)
                else
                  recipes.order(created_at: :desc)
                end

      render json: recipes
    end

    def show
      render json: @recipe
    end

    def create
      recipe = Recipe.new(recipe_params)
      if recipe.save
        render json: recipe, status: :created
      else
        render json: { errors: recipe.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @recipe.update(recipe_params)
        render json: @recipe
      else
        render json: { errors: @recipe.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @recipe.destroy
      head :no_content
    end

    private

    def set_recipe
      @recipe = Recipe.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Recipe not found"] }, status: :not_found
    end

    def recipe_params
      params.require(:recipe).permit(
        :title, :category, :servings, :cooking_time, :memo,
        ingredients: [:name, :amount, :unit],
        steps: [:order, :description]
      )
    end
  end
end
