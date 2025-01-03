class Avatar < ApplicationRecord
  has_one :item, as: :itemable

  def url 
    return "avatars/#{self.path}"
  end

  def self.default 
    return Avatar.new(title: 'Default', path: 'avatar_icon.svg')
  end
end
