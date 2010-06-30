require 'test_helper'

class ClaimsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:claims)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create claim" do
    assert_difference('Claim.count') do
      post :create, :claim => { }
    end

    assert_redirected_to claim_path(assigns(:claim))
  end

  test "should show claim" do
    get :show, :id => claims(:one).to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => claims(:one).to_param
    assert_response :success
  end

  test "should update claim" do
    put :update, :id => claims(:one).to_param, :claim => { }
    assert_redirected_to claim_path(assigns(:claim))
  end

  test "should destroy claim" do
    assert_difference('Claim.count', -1) do
      delete :destroy, :id => claims(:one).to_param
    end

    assert_redirected_to claims_path
  end
end
