class RoomsController < ApplicationController  
  before_action :set_player, only: [:new, :create, :join, :show]
  before_action :set_player_nickname, only: [:create, :join]
  before_action :is_player_in_room, only: [:show]

  def new
    @room ||= Room.new
    @room_player = RoomPlayer.new(player: current_player, room: @room)
  end

  def create
    @room = Room.new
    @room.room_players.build(player: @player, is_admin: true)
    @room_player = @room.room_players.where(player: @player)
    
    if @room.save
      redirect_to @room 
    else
      flash[:warning] = "Something get wrong. Try again"
      render :new
    end
  end

  def show
    @room ||= Room.find(params[:id])
    @room_players = @room.room_players
  end

  def join
    @room ||= Room.find_by(code: params.dig(:room_player, :code))
    @room_player = RoomPlayer.new(player: @player, room: @room)
    if (@room)
      if (@room.room_players.create(player: @player))
        redirect_to @room  
      else 
        flash[:warning] = "Something get wrong. Try again"
        render :new, status: :unprocessable_entity
      end
    else
      flash[:error] = "Room not found, please check the code again"
      render :new, status: :unprocessable_entity
    end
  end

  private

  def set_player
    @player = current_player
    return if @player.present?

    @player = Guest.new params.dig(:room_player, :nickname)
    while(!@player.save) do
      @player.session_token = SecureRandom.hex(16)
    end
    sign_in_guest( @player )
  end

  def set_player_nickname
    return if params.dig(:room_player, :nickname).nil?
    return if @player.nickname == params.dig(:room_player, :nickname)
    
    args = {}
    args[:nickname] = params.dig(:room_player, :nickname)
    return if @player.update args

    flash[:warning] = "Something get wrong. Try again"
    render :new, status: :unprocessable_entity
  end

  def is_player_in_room
    # Перенаправление на :new если пользователь не в комнате
  end
end