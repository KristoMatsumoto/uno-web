class CreateAvatars < ActiveRecord::Migration[7.1]
  def change
    create_table :avatars do |t|
      t.string :title, null: false
      t.string :path, null: false

      t.timestamps
    end
  end
end
