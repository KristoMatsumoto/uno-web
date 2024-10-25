class AddColumnsToRoom < ActiveRecord::Migration[7.1]
  def change
    add_column :rooms, :game_start, :boolean, null: false, default: false
  end
end
