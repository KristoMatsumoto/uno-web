class CreatePurchasedItems < ActiveRecord::Migration[7.1]
  def change
    create_table :purchased_items do |t|
      t.references :item, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.boolean :current, null: false, default: false

      t.timestamps
    end
  end
end
