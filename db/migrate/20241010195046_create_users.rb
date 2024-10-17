class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :login
      t.string :password_digest
      t.string :nickname, null: false

      t.timestamps
    end
  end
end
