class CreateRecipes < ActiveRecord::Migration[8.1]
  def change
    create_table :recipes do |t|
      t.string :title, null: false
      t.string :category
      t.json :ingredients
      t.json :steps
      t.integer :servings
      t.integer :cooking_time
      t.text :memo

      t.timestamps
    end
  end
end
