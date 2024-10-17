class Guest < ApplicationRecord
  include Nickname

  has_many :room_players, as: :player
  has_many :rooms, through: :room_players
  
  validates :nickname, presence: true
  validates :session_token, presence: true
  validates :session_token, uniqueness: true
  
  before_validation :set_last_activity
  before_commit :set_last_activity
  before_save :set_valid_nickname

  def initialize(attributes = {})
    super
    self.nickname ||= "Player_#{SecureRandom.hex(4)}"
    self.session_token ||= SecureRandom.hex(16)
  end

  private

  def set_last_activity
    self.last_seen_at = Time.current
  end
end
