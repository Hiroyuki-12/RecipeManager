class Recipe < ApplicationRecord
  CATEGORIES = %w[和食 洋食 中華 その他].freeze

  validates :title, presence: true, length: { maximum: 100 }
  validates :category, inclusion: { in: CATEGORIES }, length: { maximum: 50 }, allow_blank: true
end
