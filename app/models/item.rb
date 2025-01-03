class Item < ApplicationRecord
  belongs_to :itemable, polymorphic: true
  has_many :purchased_item
end
