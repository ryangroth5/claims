require 'test_helper'

class ActionTypesControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:action_types)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create action_type" do
    assert_difference('ActionType.count') do
      post :create, :action_type => { }
    end

    assert_redirected_to action_type_path(assigns(:action_type))
  end

  test "should show action_type" do
    get :show, :id => action_types(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => action_types(:one).to_param
    assert_response :success
  end

  test "should update action_type" do
    put :update, :id => action_types(:one).to_param, :action_type => { }
    assert_redirected_to action_type_path(assigns(:action_type))
  end

  test "should destroy action_type" do
    assert_difference('ActionType.count', -1) do
      delete :destroy, :id => action_types(:one).to_param
    end

    assert_redirected_to action_types_path
  end
end
