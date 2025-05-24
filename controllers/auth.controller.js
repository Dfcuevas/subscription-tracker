import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// Que es un req body? -> Es un objeto que contiene los datos que el cliente envía al servidor en una solicitud HTTP. En el contexto de una API RESTful, el req body suele contener información que el cliente desea enviar al servidor para crear o actualizar un recurso. Por ejemplo, al crear un nuevo usuario, el req body podría incluir datos como nombre, correo electrónico y contraseña.

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    //Logic to create a new user
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      {
        session,
      }
    );
    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    console.error("entro acá");
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};
export const signIn = async (req, res, next) => {};
export const signOut = async (req, res, next) => {};
