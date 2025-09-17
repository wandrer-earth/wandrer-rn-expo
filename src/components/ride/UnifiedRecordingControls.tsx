import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { Text, Icon } from "react-native-elements";
import { RecordingFAB } from "./RecordingFAB";
import { useRideStore } from "../../stores/rideStore";
import { useLocationStore } from "../../stores/locationStore";
import { LocationService } from "../../services/locationService";
import { RideService } from "../../services/rideService";
import { useToast } from "../Toast";
import * as Haptics from "expo-haptics";
import moment from "moment";
import colors from "../../styles/colors";


const RECORDING_ACTIVITY_OPTIONS = [
  { value: "bike", label: "Bike", icon: "directions-bike" },
  { value: "foot", label: "Foot", icon: "directions-walk" },
];

export const UnifiedRecordingControls: React.FC = () => {
  const {
    recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    currentRide,
    activityType,
    setActivityType,
    saveRide,
    setRecordingState,
  } = useRideStore();

  const { totalDistance, currentSpeed } = useLocationStore();
  const locationService = LocationService.getInstance();
  const rideService = RideService.getInstance();
  const { showToast } = useToast();

  const [rideName, setRideName] = useState("");
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(true);
  const [recordingActivityType, setRecordingActivityType] = useState<
    "bike" | "foot"
  >("bike");

  const isRecording = recordingState !== "not_tracking";

  useEffect(() => {
    if (recordingState === "finishing") {
      setShowFinishModal(true);
    }
  }, [recordingState]);

  useEffect(() => {
    if (isRecording) {
      setIsCardVisible(true);
    }
  }, [isRecording]);

  useEffect(() => {
    if (recordingState === "tracking") {
      // Set recording activity type when starting recording
      if (activityType === "combined") {
        setRecordingActivityType("bike"); // Default to bike for combined mode
      } else {
        setRecordingActivityType(activityType as "bike" | "foot");
      }
    }
  }, [recordingState, activityType]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const { startNewSegment } = useLocationStore.getState();

    // Set the activity type for recording (defaults to bike if coming from combined)
    const recordingType = activityType === "combined" ? "bike" : activityType;
    setRecordingActivityType(recordingType as "bike" | "foot");
    setActivityType(recordingType as any);

    startRecording();
    startNewSegment();
    await locationService.startLocationTracking();
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { endCurrentSegment } = useLocationStore.getState();
    pauseRecording();
    endCurrentSegment();
    await locationService.stopLocationTracking();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { startNewSegment } = useLocationStore.getState();
    resumeRecording();
    startNewSegment();
    await locationService.startLocationTracking();
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    stopRecording();
    await locationService.stopLocationTracking();
  };

  const handleCancel = async () => {
    Alert.alert(
      "Discard Ride?",
      "All ride data will be lost. This cannot be undone.",
      [
        {
          text: "Keep Recording",
          style: "cancel",
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            cancelRecording();
            await locationService.stopLocationTracking();
            showToast("Ride discarded", "info");
          },
        },
      ]
    );
  };

  const handleCloseCard = () => {
    setIsCardVisible(false);
  };

  const handleFinishRide = async () => {
    if (!rideName.trim()) return;

    await saveRide(rideName.trim());

    if (currentRide) {
      const savedRide = {
        ...currentRide,
        name: rideName.trim(),
        uploadStatus: "pending" as const,
      } as any;

      await rideService.saveRideLocally(savedRide);

      showToast("Uploading ride...", "info");

      try {
        const response = await rideService.uploadRide(savedRide);

        if (response.new_miles !== undefined) {
          showToast(
            `Upload complete! ${response.new_miles.toFixed(2)}km new miles added!`,
            "success",
            4000
          );
        } else {
          showToast("Upload complete!", "success");
        }
      } catch (error) {
        console.error("Failed to upload ride:", error);
        showToast("Upload failed. Will retry later.", "error");
      }
    }

    setRideName("");
    setShowFinishModal(false);
  };

  const formatDuration = (milliseconds: number) => {
    const duration = moment.duration(milliseconds);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDistance = (km: number) => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };

  const formatSpeed = (kmh: number) => {
    return `${kmh.toFixed(1)}`;
  };

  return (
    <>
      <RecordingFAB onPress={handleStart} isVisible={!isRecording} />

      {isRecording && !isCardVisible && (
        <TouchableOpacity
          style={styles.minimalIndicator}
          onPress={() => setIsCardVisible(true)}
        >
          <View style={styles.recordingDot} />
          <Text style={styles.minimalText}>Recording</Text>
          {currentRide && (
            <Text style={styles.minimalTime}>
              {formatDuration(currentRide.duration || 0)}
            </Text>
          )}
        </TouchableOpacity>
      )}

      {isRecording && isCardVisible && (
        <View style={styles.recordingCard}>
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseCard}
            >
              <Icon name="close" size={20} color={colors.gray400} />
            </TouchableOpacity>

            {currentRide && (
              <>
                <View style={styles.activityToggle}>
                  {RECORDING_ACTIVITY_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.activityButton,
                        recordingActivityType === option.value &&
                          styles.activityButtonActive,
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRecordingActivityType(
                          option.value as "bike" | "foot"
                        );
                        setActivityType(option.value as any);
                      }}
                    >
                      <Icon
                        name={option.icon}
                        size={16}
                        color={
                          recordingActivityType === option.value
                            ? colors.white
                            : colors.gray500
                        }
                      />
                      <Text
                        style={[
                          styles.activityButtonText,
                          recordingActivityType === option.value &&
                            styles.activityButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatDistance(totalDistance)}
                    </Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatDuration(currentRide.duration || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Time</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatSpeed(currentSpeed)}
                    </Text>
                    <Text style={styles.statLabel}>km/h</Text>
                  </View>

                  {currentRide.newMiles !== undefined && (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {currentRide.newMiles.toFixed(1)}
                      </Text>
                      <Text style={styles.statLabel}>New km</Text>
                    </View>
                  )}
                </View>

                <View style={styles.controlsRow}>
                  {recordingState === "tracking" && (
                    <>
                      <TouchableOpacity
                        style={styles.pauseButton}
                        onPress={handlePause}
                      >
                        <Icon name="pause" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stopButton}
                        onPress={handleStop}
                      >
                        <Icon name="stop" size={24} color="white" />
                        <Text style={styles.stopButtonText}>Finish</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        activeOpacity={0.6}
                      >
                        <Icon name="close" size={20} color={colors.secondary.red} />
                      </TouchableOpacity>
                    </>
                  )}

                  {recordingState === "paused" && (
                    <>
                      <TouchableOpacity
                        style={styles.resumeButton}
                        onPress={handleResume}
                      >
                        <Icon name="play-arrow" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.stopButton}
                        onPress={handleStop}
                      >
                        <Icon name="stop" size={24} color="white" />
                        <Text style={styles.stopButtonText}>Finish</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        activeOpacity={0.6}
                      >
                        <Icon name="close" size={20} color={colors.secondary.red} />
                      </TouchableOpacity>
                    </>
                  )}

                  {recordingState === "finishing" && (
                    <View style={styles.finishingContainer}>
                      <ActivityIndicator size="large" color={colors.main} />
                      <Text style={styles.finishingText}>
                        Finishing ride...
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      )}

      <Modal
        visible={showFinishModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Ride</Text>

            <TextInput
              style={styles.nameInput}
              placeholder="Enter ride name"
              value={rideName}
              onChangeText={setRideName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleFinishRide}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowFinishModal(false);
                  setRecordingState("paused");
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalSaveButton,
                  !rideName.trim() && styles.modalSaveButtonDisabled,
                ]}
                onPress={handleFinishRide}
                disabled={!rideName.trim()}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  minimalIndicator: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.overlay.light,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.main,
  },
  minimalText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray800,
  },
  minimalTime: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.main,
  },
  recordingCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardContent: {
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activityToggle: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.sectionBg,
    borderRadius: 20,
    marginBottom: 16,
  },
  activityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  activityButtonActive: {
    backgroundColor: colors.main,
  },
  activityButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray500,
  },
  activityButtonTextActive: {
    color: colors.white,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.gray800,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  pauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.activeRow,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  resumeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary.green,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stopButton: {
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.main,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  stopButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: colors.secondary.red,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",

  },
  finishingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  finishingText: {
    fontSize: 16,
    color: colors.gray500,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  nameInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: colors.sectionBg,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: colors.gray500,
  },
  modalSaveButton: {
    backgroundColor: colors.main,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
