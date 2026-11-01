import { palette, type, radius } from './theme';
export default {
  container: { flex: 1, backgroundColor: palette.canvas },
  loginContainer: { padding: 24, width: '100%', maxWidth: 480, alignSelf: 'center' },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 84, paddingBottom: 32, width: '100%', maxWidth: 480, alignSelf: 'center' },
  headerBox: { alignItems: 'flex-start', gap: 8, marginBottom: 32, width: '100%' },
  headerText: { ...type.title }, headerSubtext: { ...type.body, color: palette.muted },
  inputTitle: { width: '100%', marginBottom: 6 }, inputTitleText: { ...type.action, color: palette.ink },
  inputContainer: { width: '100%', flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.control, paddingHorizontal: 16, marginBottom: 20 },
  inputWithIcon: { flex: 1, minHeight: 54, paddingVertical: 14, fontFamily: 'Poppins-Regular', fontSize: 16, color: palette.ink },
  loginButton: { width: '100%', marginTop: 12 }, signUpButton: { width: '100%', marginTop: 12 }, sendResetButton: { width: '100%', marginTop: 12 },
  bottomLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 },
  newPages: { ...type.meta }, signUpText: { ...type.action, color: palette.accent, paddingVertical: 12 },
  forgotPasswordContainer: { minHeight: 48, alignSelf: 'flex-end', justifyContent: 'center' }, forgotPasswordText: { ...type.action, color: palette.accent },
  link: { ...type.action, color: palette.accent, paddingVertical: 12 }, message: { ...type.meta, marginTop: 24 },
  floatingButton: { position: 'absolute', top: 56, left: 20, width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
};
