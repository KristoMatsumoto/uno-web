class Room < ApplicationRecord
  has_many :room_players
  has_many :users, through: :room_players, source: :player, source_type: 'User'
  has_many :guests, through: :room_players, source: :player, source_type: 'Guest'

  def initialize(attributes = {})
    super
    self.code = loop do
      random_code = SecureRandom.alphanumeric(4).upcase
      break random_code unless Room.exists?(code: random_code)
    end
  end
end
