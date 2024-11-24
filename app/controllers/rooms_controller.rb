class RoomsController < ApplicationController  
  skip_before_action :verify_authenticity_token, only: [:leave, :start, :get_admin]
  before_action :set_player, only: [:new, :create, :join, :show]
  before_action :set_player_nickname, only: [:create, :join]
  before_action :is_player_in_room, only: [:show]
  before_action :set_code_uppercase, only: [:join]

  def new
    @room ||= Room.new
    @room_player = RoomPlayer.new(player: current_player, room: @room)
  end

  def create
    @room = Room.new
    @room.room_players.build(player: @player, is_admin: true)
    @room_player = @room.room_players.where(player: @player)
    @player.leave_room

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
    @settings ||= {}
  end

  def join
    @room ||= Room.find_by(code: params.dig(:room_player, :code))
    @room_player = RoomPlayer.new(player: @player, room: @room)
    @player.leave_room
    if (@room)
      if (@room.game_start? && @player.room_player.room != @room)
        flash[:warning] = "There's already a game going on in this room"
        render :new, status: :unprocessable_entity
      else 
        if (@room.room_players.create(player: @player))
          redirect_to @room  
        else 
          flash[:warning] = "Something get wrong. Try again"
          render :new, status: :unprocessable_entity
        end
      end
    else
      flash[:error] = "Room not found, please check the code again"
      render :new, status: :unprocessable_entity
    end
  end

  def leave
    room = Room.find(params[:room_id])
    player = room.room_players.find_by(player_num: params[:player_num])
    if player
      player.destroy
      render json: { message: 'Player removed from room' }, status: :ok
    else
      render json: { error: 'Player not found' }, status: :not_found
    end    
  end

  def get_admin
    room = Room.find(params[:room_id])
    player = room.room_players.find_by(player_num: params[:player_num])
    if player && player.update({ :is_admin => true })
      render json: { message: 'Player got admin access' }, status: :ok
    else
      render json: { error: 'Player not found' }, status: :not_found
    end   
  end

  def start
    room = Room.find(params[:id])
    args = {:game_start => true}
    if room.update args
      render json: { message: 'Game in room #{params[:id]} started' }, status: :ok      
    else 
      render json: { error: 'Room not found' }, status: :not_found
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
    return if @player.room_player&.room_id == params[:id].to_i
    redirect_to new_room_path
  end

  def set_code_uppercase
    params.dig(:room_player, :code).upcase!
    params.dig(:room_player, :code).gsub!(" ", "")
  end
end
