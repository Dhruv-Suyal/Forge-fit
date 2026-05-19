const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const TodayTask = require('../models/TodayTask');
const { generateTasksWithAI } = require('../services/aiCAll');

exports.postSignUp = async (req, res) => {
    try {

        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!", success: false });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters", success: false });
        }

        let existedUser = await User.findOne({ email });

        if (existedUser) {
            return res.status(400).json({ message: "User already exist", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        const { password: _, ...safeUser } = newUser._doc;

        res.json({ message: "User successfully signUp", success: true, user: safeUser });

    } catch (err) {
        res.status(500).json({ error: err.message, success: false });
    }
}

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const existUser = await User.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: "User not exist sign Up first!" });
        }
        if (!existUser.password) {
            return res.status(400).json({ message: "SignUp with Google" });
        }

        const isMatch = await bcrypt.compare(password, existUser.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = jwt.sign({ id: existUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const { password: _, ...safeUser } = existUser._doc;


        res.json({ message: "Login successfull", user: safeUser });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.saveProfile = async (req, res) => {
    try {
        console.log("come to the backend")
        const {
            displayName,
            dateofBirth,
            biologicalSex,
            height,
            weight,
            location,
            primaryGoal
        } = req.body;
        console.log(req.body)
        const bmi = (
            weight / ((height / 100) * (height / 100))
        ).toFixed(1);

        const tdee = Math.round(weight * 24 * 1.55);

        const profile = await Profile.create({
            userId: req.user.id,
            displayName,
            dateofBirth,
            biologicalSex,
            height,
            weight,
            location,
            primaryGoal,
            bmi,
            tdee
        });
        console.log("profile created");

        await User.findByIdAndUpdate(req.user.id, {
            onboardingCompleted: true
        });

        const today =
            new Date().toISOString().split('T')[0];

        // prevent duplicates
        const existingTasks =
            await TodayTask.find({
                userId: req.user.id,
                date: today
            });

        if (existingTasks.length <= 0) {

            // AI generation
            const aiData =
                await generateTasksWithAI(profile);

            // attach userId + date
            const tasks =
                aiData.tasks.map(task => ({
                    ...task,
                    userId: req.user.id,
                    date: today
                }));

            // save
            const formattedTasks = tasks.map(task => ({

                ...task,

                category:
                    task.category
                        ?.toLowerCase()
                        ?.trim(),

                difficulty:
                    task.difficulty
                        ?.toLowerCase()
                        ?.trim()

            }));

            await TodayTask.insertMany(formattedTasks);
        }

        res.json({
            success: true,
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id });
        res.json({
            success: true,
            profile: profile || null
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getLogout = (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        message: "Logged out successfully"
    });

}