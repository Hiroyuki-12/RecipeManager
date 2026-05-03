class Recipe < ApplicationRecord
  CATEGORIES = %w[和食 洋食 中華 その他].freeze

  validates :title, presence: true, length: { maximum: 100 }
  validates :category, inclusion: { in: CATEGORIES }, length: { maximum: 50 }, allow_blank: true
  validates :servings, numericality: { only_integer: true, greater_than_or_equal_to: 1 }, allow_nil: true
  validates :cooking_time, numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validate :ingredients_must_have_at_least_one
  validate :steps_must_have_at_least_one

  private

  def ingredients_must_have_at_least_one
    return if ingredients.is_a?(Array) && ingredients.any? { |i| i.is_a?(Hash) && i["name"].present? }

    errors.add(:ingredients, "は1件以上入力してください")
  end

  def steps_must_have_at_least_one
    return if steps.is_a?(Array) && steps.any? { |s| s.is_a?(Hash) && s["description"].present? }

    errors.add(:steps, "は1件以上入力してください")
  end
end
