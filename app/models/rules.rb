class Rules
  Rule = Struct.new(:id, :title, :description, :icon, :option)
  @@rules = []

  def self.load_rules
    @@rules = [
      Rule.new('skip_after_draw_card_from_dropping', "Draw only 1", "Player can take only 1 card from the desk per turn", 
        '', 'check_box'),
      Rule.new('skip_after_draw_cards', "Draw and skip turn", "After player takes cards after +2 and/or +4, he misses his turn", 
        '', 'check_box'),
      Rule.new('can_hit_skip_turn', "Hit the \"skip turn\" card", "The player who would have been subject to the \"Skip turn\" action can play a card of the same value to avoid missing a turn", 
        '', 'check_box'),
    ]
  end

  def self.all
    @@rules
  end

  def self.find(id)
    @@rules.find { |rule| rule.id == id }
  end
end