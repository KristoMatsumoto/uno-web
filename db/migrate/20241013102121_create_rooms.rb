class CreateRooms < ActiveRecord::Migration[7.1]
  def change
    create_table :rooms do |t|
      t.string :code, null: false, index: {unique: true}
      t.timestamps
    end

    create_table :room_players do |t|
      t.references :room, null: false, foreign_key: true
      t.references :player, polymorphic: true, null: false, index: {unique: true}
      t.integer :player_num, null: false
      t.boolean :is_admin, null: false, default: false
      t.timestamps
    end
    
    add_index :room_players, [:player_num, :room_id]
  end
end
