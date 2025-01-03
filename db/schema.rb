# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_01_02_024436) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "avatars", force: :cascade do |t|
    t.string "title", null: false
    t.string "path", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "guests", force: :cascade do |t|
    t.string "nickname", null: false
    t.string "session_token", null: false
    t.datetime "last_seen_at", default: -> { "CURRENT_TIMESTAMP" }, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_token"], name: "index_guests_on_session_token", unique: true
  end

  create_table "items", force: :cascade do |t|
    t.string "itemable_type", null: false
    t.bigint "itemable_id", null: false
    t.integer "price", null: false
    t.boolean "purchased", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["itemable_type", "itemable_id"], name: "index_items_on_itemable"
  end

  create_table "purchased_items", force: :cascade do |t|
    t.bigint "item_id", null: false
    t.bigint "user_id", null: false
    t.boolean "current", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_purchased_items_on_item_id"
    t.index ["user_id"], name: "index_purchased_items_on_user_id"
  end

  create_table "room_players", force: :cascade do |t|
    t.bigint "room_id", null: false
    t.string "player_type", null: false
    t.bigint "player_id", null: false
    t.integer "player_num", null: false
    t.boolean "is_admin", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["player_num", "room_id"], name: "index_room_players_on_player_num_and_room_id"
    t.index ["player_type", "player_id"], name: "index_room_players_on_player", unique: true
    t.index ["room_id"], name: "index_room_players_on_room_id"
  end

  create_table "rooms", force: :cascade do |t|
    t.string "code", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "game_start", default: false, null: false
    t.index ["code"], name: "index_rooms_on_code", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "login"
    t.string "password_digest"
    t.string "nickname", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "purchased_items", "items"
  add_foreign_key "purchased_items", "users"
  add_foreign_key "room_players", "rooms"
end
