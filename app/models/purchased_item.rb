class PurchasedItem < ApplicationRecord
  belongs_to :user
  belongs_to :item

  # проверка на current
end
