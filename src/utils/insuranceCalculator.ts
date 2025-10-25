/**
 * 保険設計シミュレーション計算ロジック
 *
 * 必要保障額の計算、遺族年金の推定、教育費の計算などを行う
 */

import type {
  ChildInfo,
  YearlyExpense,
  YearlyIncome,
  EducationCostBreakdown,
  SurvivorPension,
  CoverageAnalysis,
} from '../types/insurance';

/**
 * 教育費データベース（年間費用）
 * 出典: 文部科学省「子供の学習費調査」を参考
 */
export const EDUCATION_COSTS = {
  elementary_public: 320000,     // 公立小学校（年間）
  elementary_private: 1600000,   // 私立小学校
  junior_high_public: 490000,    // 公立中学校
  junior_high_private: 1400000,  // 私立中学校
  high_school_public: 460000,    // 公立高校
  high_school_private: 970000,   // 私立高校
  university_national: 2400000,  // 国立大学（4年間総額）
  university_private: 4500000,   // 私立大学文系（4年間総額）
  university_science: 6000000,   // 私立大学理系（4年間総額）
} as const;

/**
 * 遺族年金定数
 */
const SURVIVOR_PENSION_CONSTANTS = {
  BASIC_PENSION_FULL: 816000,              // 基礎年金満額（年間、2024年度）
  CHILD_ALLOWANCE: 228700,                 // 子の加算額（1人当たり、年間）
  CHILD_ALLOWANCE_THIRD: 76200,           // 3人目以降の加算額
  EARNINGS_RELATED_RATE: 0.005481,        // 報酬比例部分の乗率（旧基準）
  SPOUSAL_PENSION_RATE: 0.75,             // 配偶者の年金受給率
} as const;

/**
 * 子供の教育費を計算
 *
 * @param children - 子供情報の配列
 * @returns 教育費の総額と内訳
 */
export function calculateEducationCost(children: ChildInfo[]): {
  totalCost: number;
  breakdown: EducationCostBreakdown[];
} {
  const breakdown: EducationCostBreakdown[] = [];
  let totalCost = 0;

  children.forEach((child, index) => {
    // 小学校（6年間）
    const elementaryCost = child.educationPlan.elementary === 'public'
      ? EDUCATION_COSTS.elementary_public * 6
      : EDUCATION_COSTS.elementary_private * 6;

    if (child.age < 6) {
      // まだ小学校入学前
      for (let age = 6; age < 12; age++) {
        breakdown.push({
          childIndex: index,
          age,
          stage: `小学校（${child.educationPlan.elementary === 'public' ? '公立' : '私立'}）`,
          cost: child.educationPlan.elementary === 'public'
            ? EDUCATION_COSTS.elementary_public
            : EDUCATION_COSTS.elementary_private,
        });
      }
      totalCost += elementaryCost;
    } else if (child.age < 12) {
      // 小学校在学中
      const remainingYears = 12 - child.age;
      const cost = (child.educationPlan.elementary === 'public'
        ? EDUCATION_COSTS.elementary_public
        : EDUCATION_COSTS.elementary_private) * remainingYears;

      for (let age = child.age; age < 12; age++) {
        breakdown.push({
          childIndex: index,
          age,
          stage: `小学校（${child.educationPlan.elementary === 'public' ? '公立' : '私立'}）`,
          cost: child.educationPlan.elementary === 'public'
            ? EDUCATION_COSTS.elementary_public
            : EDUCATION_COSTS.elementary_private,
        });
      }
      totalCost += cost;
    }

    // 中学校（3年間）
    if (child.age < 15) {
      const startAge = Math.max(child.age, 12);
      const remainingYears = 15 - startAge;
      const cost = (child.educationPlan.juniorHigh === 'public'
        ? EDUCATION_COSTS.junior_high_public
        : EDUCATION_COSTS.junior_high_private) * remainingYears;

      for (let age = startAge; age < 15; age++) {
        breakdown.push({
          childIndex: index,
          age,
          stage: `中学校（${child.educationPlan.juniorHigh === 'public' ? '公立' : '私立'}）`,
          cost: child.educationPlan.juniorHigh === 'public'
            ? EDUCATION_COSTS.junior_high_public
            : EDUCATION_COSTS.junior_high_private,
        });
      }
      totalCost += cost;
    }

    // 高校（3年間）
    if (child.age < 18) {
      const startAge = Math.max(child.age, 15);
      const remainingYears = 18 - startAge;
      const cost = (child.educationPlan.highSchool === 'public'
        ? EDUCATION_COSTS.high_school_public
        : EDUCATION_COSTS.high_school_private) * remainingYears;

      for (let age = startAge; age < 18; age++) {
        breakdown.push({
          childIndex: index,
          age,
          stage: `高校（${child.educationPlan.highSchool === 'public' ? '公立' : '私立'}）`,
          cost: child.educationPlan.highSchool === 'public'
            ? EDUCATION_COSTS.high_school_public
            : EDUCATION_COSTS.high_school_private,
        });
      }
      totalCost += cost;
    }

    // 大学（4年間）
    if (child.educationPlan.university !== 'none' && child.age < 22) {
      const startAge = Math.max(child.age, 18);
      if (startAge < 22) {
        let universityCost = 0;
        if (child.educationPlan.university === 'national') {
          universityCost = EDUCATION_COSTS.university_national;
        } else if (child.educationPlan.university === 'private') {
          universityCost = EDUCATION_COSTS.university_private;
        } else {
          universityCost = EDUCATION_COSTS.university_science;
        }

        const remainingYears = 22 - startAge;
        const annualCost = universityCost / 4;
        const cost = annualCost * remainingYears;

        for (let age = startAge; age < 22; age++) {
          const universityType = child.educationPlan.university === 'national'
            ? '国立'
            : child.educationPlan.university === 'private'
            ? '私立文系'
            : '私立理系';

          breakdown.push({
            childIndex: index,
            age,
            stage: `大学（${universityType}）`,
            cost: annualCost,
          });
        }
        totalCost += cost;
      }
    }
  });

  return { totalCost, breakdown };
}

/**
 * 遺族の必要生活費を計算
 *
 * @param params - 計算パラメータ
 * @returns 総必要額と年別内訳
 */
export function calculateSurvivorExpenses(params: {
  monthlyExpense: number;
  spouseAge: number;
  children: ChildInfo[];
  housingCost: number;
}): {
  totalExpenses: number;
  yearlyBreakdown: YearlyExpense[];
} {
  const { monthlyExpense, spouseAge, children, housingCost } = params;
  const yearlyBreakdown: YearlyExpense[] = [];
  let totalExpenses = 0;

  // 配偶者の平均余命（85歳まで生きると仮定）
  const spouseLifeExpectancy = 85;
  const years = spouseLifeExpectancy - spouseAge;

  // 教育費を計算
  const { breakdown: educationBreakdown } = calculateEducationCost(children);

  // 年別に計算
  for (let year = 0; year < years; year++) {

    // その年の生活費
    const livingExpense = monthlyExpense * 12;

    // 住居費（住宅ローンは完済まで、家賃は継続）
    const housing = housingCost;

    // その年の教育費
    let educationCost = 0;
    educationBreakdown.forEach(item => {
      if (item.age === children[item.childIndex].age + year) {
        educationCost += item.cost;
      }
    });

    const total = livingExpense + housing + educationCost;

    yearlyBreakdown.push({
      year,
      livingExpense,
      housingCost: housing,
      educationCost,
      total,
    });

    totalExpenses += total;
  }

  return { totalExpenses, yearlyBreakdown };
}

/**
 * 収入見込みを計算
 *
 * @param params - 計算パラメータ
 * @returns 総収入と年別内訳
 */
export function calculateExpectedIncome(params: {
  spouseIncome: number;
  pensionAmount: number;
  otherIncome: number;
  years: number;
}): {
  totalIncome: number;
  yearlyBreakdown: YearlyIncome[];
} {
  const { spouseIncome, pensionAmount, otherIncome, years } = params;
  const yearlyBreakdown: YearlyIncome[] = [];
  let totalIncome = 0;

  for (let year = 0; year < years; year++) {
    const total = spouseIncome + pensionAmount + otherIncome;

    yearlyBreakdown.push({
      year,
      spouseIncome,
      pensionAmount,
      otherIncome,
      total,
    });

    totalIncome += total;
  }

  return { totalIncome, yearlyBreakdown };
}

/**
 * 遺族年金を計算（簡易版）
 *
 * @param params - 計算パラメータ
 * @returns 遺族年金の内訳
 */
export function calculateSurvivorPension(params: {
  averageSalary: number;
  insuredMonths: number;
  children: number;
}): SurvivorPension {
  const { averageSalary, insuredMonths, children } = params;

  // 基礎年金（満額の75%）
  const basicPension = SURVIVOR_PENSION_CONSTANTS.BASIC_PENSION_FULL * SURVIVOR_PENSION_CONSTANTS.SPOUSAL_PENSION_RATE;

  // 報酬比例部分（簡易計算）
  const earningsRelated = averageSalary * SURVIVOR_PENSION_CONSTANTS.EARNINGS_RELATED_RATE * insuredMonths;

  // 子の加算額
  let childAllowance = 0;
  if (children >= 1) {
    childAllowance += SURVIVOR_PENSION_CONSTANTS.CHILD_ALLOWANCE;
  }
  if (children >= 2) {
    childAllowance += SURVIVOR_PENSION_CONSTANTS.CHILD_ALLOWANCE;
  }
  if (children >= 3) {
    childAllowance += SURVIVOR_PENSION_CONSTANTS.CHILD_ALLOWANCE_THIRD * (children - 2);
  }

  const totalAnnual = basicPension + earningsRelated + childAllowance;

  return {
    basicPension: Math.round(basicPension),
    earningsRelated: Math.round(earningsRelated),
    childAllowance: Math.round(childAllowance),
    totalAnnual: Math.round(totalAnnual),
  };
}

/**
 * 必要保障額を計算
 *
 * @param expenses - 総支出
 * @param income - 総収入
 * @param assets - 既存資産
 * @returns 必要保障額と内訳
 */
export function calculateRequiredCoverage(
  expenses: number,
  income: number,
  assets: number
): {
  requiredAmount: number;
  breakdown: {
    totalExpenses: number;
    totalIncome: number;
    existingAssets: number;
    gap: number;
  };
} {
  const gap = expenses - income - assets;
  const requiredAmount = Math.max(0, gap); // 負の値にならないように

  return {
    requiredAmount: Math.round(requiredAmount),
    breakdown: {
      totalExpenses: Math.round(expenses),
      totalIncome: Math.round(income),
      existingAssets: Math.round(assets),
      gap: Math.round(gap),
    },
  };
}

/**
 * 完全な保障額分析を実行
 *
 * @param params - 全パラメータ
 * @returns 完全な分析結果
 */
export function performCoverageAnalysis(params: {
  monthlyExpense: number;
  spouseAge: number;
  children: ChildInfo[];
  housingCost: number;
  spouseIncome: number;
  otherIncome: number;
  savings: number;
  securities: number;
  realEstate: number;
  averageSalary: number;
  insuredMonths: number;
}): CoverageAnalysis {
  // 配偶者の余命年数を計算
  const spouseLifeExpectancy = 85;
  const years = spouseLifeExpectancy - params.spouseAge;

  // 遺族年金を計算
  const pension = calculateSurvivorPension({
    averageSalary: params.averageSalary,
    insuredMonths: params.insuredMonths,
    children: params.children.filter(c => c.age < 18).length, // 18歳未満の子供のみ
  });

  // 支出を計算
  const { totalExpenses, yearlyBreakdown: yearlyExpenses } = calculateSurvivorExpenses({
    monthlyExpense: params.monthlyExpense,
    spouseAge: params.spouseAge,
    children: params.children,
    housingCost: params.housingCost,
  });

  // 収入を計算
  const { totalIncome, yearlyBreakdown: yearlyIncome } = calculateExpectedIncome({
    spouseIncome: params.spouseIncome,
    pensionAmount: pension.totalAnnual,
    otherIncome: params.otherIncome,
    years,
  });

  // 既存資産の合計
  const existingAssets = params.savings + params.securities + params.realEstate;

  // 必要保障額を計算
  const { requiredAmount, breakdown } = calculateRequiredCoverage(
    totalExpenses,
    totalIncome,
    existingAssets
  );

  return {
    requiredAmount,
    breakdown,
    yearlyExpenses,
    yearlyIncome,
  };
}
