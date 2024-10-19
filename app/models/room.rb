class Room < ApplicationRecord
  has_many :room_players
  has_many :users, through: :room_players, source: :player, source_type: 'User'
  has_many :guests, through: :room_players, source: :player, source_type: 'Guest'

  before_validation :set_code_uppercase
  
  def initialize(attributes = {})
    super
    self.code = loop do
      random_code = SecureRandom.alphanumeric(4).upcase
      break random_code unless Room.exists?(code: random_code)
    end
  end

  def get_next_player_num
    room_players = self.room_players
    room_players.count.times do | index |
      no_index = true
      room_players.each do | player |
        if (player.player_num.to_i == index)
          no_index = false
          break
        end
      end
      if (no_index)
        return index
      end
    end
    return room_players.count
  end

  private

  def set_code_uppercase
    self.code.upcase!
    self.code.gsub!(" ", "")
  end
end
