require 'test_helper'

class FaultTypesControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:fault_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create fault_type" do
    assert_difference('FaultType.count') do
      post :create, :fault_type => { }
    end

    assert_redirected_to fault_type_path(assigns(:fault_type))
  end

  test "should show fault_type" do
    get :show, :id => fault_types(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => fault_types(:one).to_param
    assert_response :success
  end

  test "should update fault_type" do
    put :update, :id => fault_types(:one).to_param, :fault_type => { }
    assert_redirected_to fault_type_path(assigns(:fault_type))
  end

  test "should destroy fault_type" do
    assert_difference('FaultType.count', -1) do
      delete :destroy, :id => fault_types(:one).to_param
    end

    assert_redirected_to fault_types_path
  end
end
