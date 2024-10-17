class CreateGuests < ActiveRecord::Migration[7.1]
  def change
    create_table :guests do |t|
      t.string :nickname, null: false
      t.string :session_token, null: false, index: {unique: true}
      t.datetime :last_seen_at, null: false, default: -> { 'CURRENT_TIMESTAMP' }

      t.timestamps
    end
  end
end
