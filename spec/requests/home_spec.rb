require "rails_helper"

RSpec.describe "Home" do
  describe "GET /" do
    it "redirects in not logged in" do
      get "/"
      expect(response).to have_http_status(:redirect)
      expect(response).to redirect_to(new_user_session_path)
    end

    it "returns http success when logged in" do
      user = User.new(email: "user@redalert1741.org")
      user.confirm

      sign_in user

      get root_path
      expect(response).to be_successful
      expect(response).to have_http_status(:success)
    end
  end
end
