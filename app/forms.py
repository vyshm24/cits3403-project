from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Regexp


class SignInForm(FlaskForm):
    # FlaskForm provides CSRF protection automatically for this form.
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])


class SignUpForm(FlaskForm):
    # Validators keep basic auth rules close to the form definition.
    username = StringField(
        "Username",
        validators=[
            DataRequired(),
            Length(min=3, max=20),
            Regexp(
                r"^[A-Za-z0-9_]+$",
                message="Username can only contain letters, numbers, and underscores.",
            ),
        ],
    )
    email = StringField(
        "Email",
        validators=[
            DataRequired(),
            Email(message="Please enter a valid email address."),
        ],
    )
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
    confirm_password = PasswordField(
        "Confirm Password",
        validators=[
            DataRequired(),
            EqualTo("password", message="Passwords do not match."),
        ],
    )


class LogoutForm(FlaskForm):
    # A minimal protected form for logout requests.
    pass


class SubmitItineraryForm(FlaskForm):
    # A minimal protected form for itinerary submissions.
    pass
