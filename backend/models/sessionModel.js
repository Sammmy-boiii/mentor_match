import mongoose from 'mongoose';
import crypto from 'crypto';

const sessionSchema = new mongoose.Schema({
  userId: {type:String, required:true},
  tutId: {type:String, required:true},
  slotDate: {type:Date, required:true},
  slotTime: {type:String, required:true},
  userData: {type:Object, required:true},
  tutData: {type:Object, required:true},
  amount: {type:Number, required:true},
  date: {type:Date, required:true},
  cancelled: {type:Boolean, default:false},
  payment:{type:Boolean, default:false},
  isCompleted:{type:Boolean, default:false},
  transactionId: {type:String, default:""},
  paymentMethod: {type:String, default:""},
  paymentId: {type:String, default:""},
  // Video Call Fields
  roomId: {type:String, unique:true, sparse:true},
  roomCreatedAt: {type:Date},
  callStartedAt: {type:Date},
  callEndedAt: {type:Date},
  callDuration: {type:Number, default:0}, // in seconds
  callStatus: {type:String, enum:['not-started', 'waiting', 'in-progress', 'ended'], default:'not-started'},
})

// Generate unique room ID when payment is completed
sessionSchema.methods.generateRoomId = function() {
  if (!this.roomId) {
    this.roomId = `room_${this._id}_${crypto.randomBytes(8).toString('hex')}`;
    this.roomCreatedAt = new Date();
  }
  return this.roomId;
}
const sessionModel = mongoose.models.session || mongoose.model('session', sessionSchema);

export default sessionModel;